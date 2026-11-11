// Each character is one final 16x16 Minecraft texture pixel.
// Enlarged images are previews, while the game textures use the original pixel buffers.
let fs = require('node:fs');
let path = require('node:path');
let assert = require('node:assert/strict');
let sharp = require('C:/Users/Tony/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

let root = path.resolve(__dirname, '../..');
let output = path.join(root, 'docs/development/assets/tofu_curios');
let sprites = [
    {
        name: 'tofu_miner_lantern',
        label: "Tofu Miner's Lantern",
        palette: {
            o: '#303a36', s: '#5c7162', M: '#a7b7a7', H: '#e7ebce',
            g: '#687b49', W: '#d5d999', L: '#efbc61',
            F: '#fff4d1', f: '#e8d7a4', p: '#baab76'
        },
        rows: [
            '................',
            '......oooo......',
            '.....oMHHMo.....',
            '.....oH..Mo.....',
            '......oMMo......',
            '....ooMMMMoo....',
            '...oHMMMMMMso...',
            '...oHggggggso...',
            '...oMWLLLLWso...',
            '...oMLFFffLso...',
            '...oMLFffpLso...',
            '...oMLfpppLso...',
            '...oMgLLLLgso...',
            '...oHMMMMMMso...',
            '....oooooooo....',
            '................'
        ]
    },
    {
        name: 'tofu_hunter_knife',
        label: "Tofu Hunter's Knife",
        palette: {
            o: '#303a36', s: '#708476', M: '#bcccb7', H: '#f6f2d9',
            g: '#657c43', G: '#a7bc70'
        },
        rows: [
            '................',
            '............oo..',
            '...........oHMo.',
            '..........oHMMo.',
            '.........oHMMso.',
            '........oHMMsso.',
            '.......oHMMsso..',
            '......oHMMsso...',
            '.....oHMMsso....',
            '....oGGMMoo.....',
            '...oGgGoo.......',
            '..oGggoo........',
            '.oGggso.........',
            '.oMgso..........',
            '..ooo...........',
            '................'
        ]
    }
];

let draw = sprite => {
    assert.equal(sprite.rows.length, 16);
    let pixels = Buffer.alloc(16 * 16 * 4);
    sprite.rows.forEach((row, y) => {
        assert.equal(row.length, 16, `${sprite.name} row ${y}`);
        [...row].forEach((symbol, x) => {
            if (symbol === '.') return;
            assert.ok(sprite.palette[symbol], symbol);
            let rgb = sprite.palette[symbol].slice(1);
            let offset = (y * 16 + x) * 4;
            pixels[offset] = parseInt(rgb.slice(0, 2), 16);
            pixels[offset + 1] = parseInt(rgb.slice(2, 4), 16);
            pixels[offset + 2] = parseInt(rgb.slice(4, 6), 16);
            pixels[offset + 3] = 255;
        });
    });
    return pixels;
};

let main = async () => {
    fs.mkdirSync(output, {recursive: true});
    let composite = [];
    for (let index = 0; index < sprites.length; index++) {
        let sprite = sprites[index];
        let pixels = draw(sprite);
        let texture = path.join(output, `${sprite.name}.png`);
        await sharp(pixels, {raw: {width: 16, height: 16, channels: 4}}).png().toFile(texture);
        let enlarged = await sharp(pixels, {raw: {width: 16, height: 16, channels: 4}})
            .resize(320, 320, {kernel: 'nearest'}).png().toBuffer();
        composite.push({input: enlarged, left: index * 360 + 20, top: 48});
        let text = Buffer.from(`<svg width="360" height="40"><text x="180" y="28" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#edf0dc">${sprite.label}</text></svg>`);
        composite.push({input: text, left: index * 360, top: 0});
    }
    await sharp({create: {width: 720, height: 384, channels: 4, background: '#667169'}})
        .composite(composite).png().toFile(path.join(output, 'preview.png'));
    console.log(`Created ${sprites.length} native 16x16 sprites in ${output}`);
};

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
