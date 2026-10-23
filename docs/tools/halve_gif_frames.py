from __future__ import annotations

import argparse
import os
import tempfile
from pathlib import Path

from PIL import Image


def halve_gif_frames(input_path: Path, output_path: Path) -> tuple[int, int, int]:
    input_path = input_path.resolve()
    output_path = output_path.resolve()

    with Image.open(input_path) as image:
        if image.format != "GIF":
            raise ValueError(f"Not a GIF file: {input_path}")
        if image.n_frames < 2:
            raise ValueError("The GIF must contain at least two frames.")

        original_frame_count = image.n_frames
        loop = image.info.get("loop", 0)
        frames: list[Image.Image] = []
        durations: list[int] = []

        for frame_index in range(0, original_frame_count, 2):
            image.seek(frame_index)
            frames.append(image.convert("RGBA"))
            duration = int(image.info.get("duration", 0))

            if frame_index + 1 < original_frame_count:
                image.seek(frame_index + 1)
                duration += int(image.info.get("duration", 0))

            durations.append(duration)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    file_descriptor, temporary_name = tempfile.mkstemp(
        prefix=f".{output_path.stem}.", suffix=".tmp.gif", dir=output_path.parent
    )
    os.close(file_descriptor)
    temporary_path = Path(temporary_name)

    try:
        frames[0].save(
            temporary_path,
            format="GIF",
            save_all=True,
            append_images=frames[1:],
            duration=durations,
            loop=loop,
            disposal=1,
            optimize=False,
        )

        with Image.open(temporary_path) as result:
            result_frame_count = result.n_frames
            result_duration = 0
            for frame_index in range(result.n_frames):
                result.seek(frame_index)
                result_duration += int(result.info.get("duration", 0))

        expected_frame_count = (original_frame_count + 1) // 2
        expected_duration = sum(durations)
        if result_frame_count != expected_frame_count:
            raise RuntimeError(
                f"Expected {expected_frame_count} frames, got {result_frame_count}."
            )
        if result_duration != expected_duration:
            raise RuntimeError(
                f"Expected {expected_duration} ms, got {result_duration} ms."
            )

        os.replace(temporary_path, output_path)
    finally:
        temporary_path.unlink(missing_ok=True)

    return original_frame_count, expected_frame_count, expected_duration


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Keep every other GIF frame while preserving total playback time."
    )
    parser.add_argument("input", type=Path, help="GIF file to process")
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output path; defaults to replacing the input file",
    )
    arguments = parser.parse_args()
    output_path = arguments.output or arguments.input

    original_count, result_count, duration = halve_gif_frames(
        arguments.input, output_path
    )
    print(
        f"Reduced {original_count} frames to {result_count}; "
        f"duration remains {duration} ms: {output_path.resolve()}"
    )


if __name__ == "__main__":
    main()