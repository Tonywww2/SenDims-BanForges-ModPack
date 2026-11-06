// priority: 1590
// 星界躯体升级为星界卢恩／星界框架（组合锻造，配方见 server_scripts/recipes/astral_gems.js）。
// 躯体里的填充物随之迁入新容器：整体平移到新布局里最贴合的位置，保持相对摆放；
// 落在关闭格上的就近放进空的开放格；仍放不下的写入模组自带的 Overflow，格子空出后由模组自动取回。
; (() => {
  let A = global.sdbfAstral;
  if (!A || !A.apiReady) return;
  let Compound = Java.loadClass('net.minecraft.nbt.CompoundTag');
  let ListTag = Java.loadClass('net.minecraft.nbt.ListTag');
  let ItemStack = Java.loadClass('net.minecraft.world.item.ItemStack');
  // 与模组 AstralStoredItems 相同的存储格式：AstralContainer{Version, Size, Items[{Slot, Stack}], Overflow[]}，
  // Slot 为物理格序号 y×宽+x（包括关闭格）。
  let KEY = 'AstralContainer', COMPOUND = 10;
  let base = A.containers.base;
  let targets = {};
  Object.keys(A.containers).forEach(kind => { if (kind !== 'base') targets[A.containers[kind].id] = A.containers[kind]; });
  let U = A.containerUpgrade = {};

  U.open = (layout, x, y) => x >= 0 && y >= 0 && x < layout.width && y < layout.height && layout.rows[y].charAt(x) === 'X';

  // 整体平移量：落在开放格上的躯体格最多者；相同时取最靠近中心的，再取靠上、靠左的。
  U.offset = layout => {
    let best = null;
    for (let oy = 0; oy <= layout.height - base.height; oy++) {
      for (let ox = 0; ox <= layout.width - base.width; ox++) {
        let fit = 0;
        for (let y = 0; y < base.height; y++) for (let x = 0; x < base.width; x++) {
          if (U.open(base, x, y) && U.open(layout, x + ox, y + oy)) fit++;
        }
        let drift = Math.abs(ox + base.width / 2 - layout.width / 2) + Math.abs(oy + base.height / 2 - layout.height / 2);
        if (!best || fit > best.fit || fit === best.fit && drift < best.drift) best = { x: ox, y: oy, fit: fit, drift: drift };
      }
    }
    return best;
  };

  // positioned：[{x, y, item}]（躯体坐标）；loose：没有有效位置的物品。返回 {cells:[{x, y, item}], overflow:[item]}。
  U.place = (layout, positioned, loose) => {
    let offset = U.offset(layout), used = {}, cells = [], displaced = [], overflow = [];
    let key = (x, y) => x + ',' + y;
    let take = (x, y, item) => { used[key(x, y)] = true; cells.push({ x: x, y: y, item: item }); };
    let free = [];
    for (let y = 0; y < layout.height; y++) for (let x = 0; x < layout.width; x++) if (U.open(layout, x, y)) free.push([x, y]);
    positioned.forEach(p => {
      let x = p.x + offset.x, y = p.y + offset.y;
      if (U.open(layout, x, y) && !used[key(x, y)]) take(x, y, p.item);
      else displaced.push({ x: x, y: y, item: p.item });
    });
    let nearest = (x, y) => {
      let best = null, bestDistance = 0;
      free.forEach(cell => {
        if (used[key(cell[0], cell[1])]) return;
        let distance = Math.abs(cell[0] - x) + Math.abs(cell[1] - y);
        if (!best || distance < bestDistance) { best = cell; bestDistance = distance; }
      });
      return best;
    };
    displaced.forEach(p => { let cell = nearest(p.x, p.y); if (cell) take(cell[0], cell[1], p.item); else overflow.push(p.item); });
    loose.forEach(item => {
      let cell = null;
      for (let i = 0; i < free.length && !cell; i++) if (!used[key(free[i][0], free[i][1])]) cell = free[i];
      if (cell) take(cell[0], cell[1], item); else overflow.push(item);
    });
    return { cells: cells, overflow: overflow };
  };

  // 按模组的读取规则解析躯体：旧版 12×9 存储（Size 108）按 (y+2)×12+(x+4) 换算；越界、重复格和 Overflow 都保留下来。
  U.readBody = body => {
    let out = { positioned: [], loose: [] }, tag = body.getTag();
    if (!tag || !tag.contains(KEY, COMPOUND)) return out;
    let root = tag.getCompound(KEY), legacy = root.getInt('Size') === 108, seen = {};
    let entries = root.getList('Items', COMPOUND);
    for (let i = 0; i < entries.size(); i++) {
      let entry = entries.getCompound(i), stackTag = entry.getCompound('Stack');
      if (ItemStack.of(stackTag).isEmpty()) continue;
      let index = entry.getInt('Slot');
      let x = legacy ? index % 12 - 4 : index % base.width;
      let y = legacy ? Math.floor(index / 12) - 2 : Math.floor(index / base.width);
      let inside = index >= 0 && x >= 0 && y >= 0 && x < base.width && y < base.height && U.open(base, x, y);
      if (inside && !seen[x + ',' + y]) { seen[x + ',' + y] = true; out.positioned.push({ x: x, y: y, item: stackTag }); }
      else out.loose.push(stackTag);
    }
    let overflow = root.getList('Overflow', COMPOUND);
    for (let i = 0; i < overflow.size(); i++) {
      let stackTag = overflow.getCompound(i);
      if (!ItemStack.of(stackTag).isEmpty()) out.loose.push(stackTag);
    }
    return out;
  };

  U.upgrade = (body, template) => {
    let layout = targets[A.itemId(template)];
    if (!layout || A.itemId(body) !== base.id) throw new Error('not_upgradable');
    let result = template.copyWithCount(1), read = U.readBody(body);
    if (!read.positioned.length && !read.loose.length) return result;
    let placed = U.place(layout, read.positioned, read.loose);
    let root = new Compound(), items = new ListTag();
    root.putInt('Version', 1);
    root.putInt('Size', layout.width * layout.height);
    placed.cells.forEach(cell => {
      let entry = new Compound();
      entry.putInt('Slot', cell.y * layout.width + cell.x);
      entry.put('Stack', cell.item.copy());
      items.add(entry);
    });
    root.put('Items', items);
    if (placed.overflow.length) {
      let list = new ListTag();
      placed.overflow.forEach(item => list.add(item.copy()));
      root.put('Overflow', list);
    }
    result.getOrCreateTag().put(KEY, root);
    return result;
  };

  AstralDataPredicates.register('sdbf:astral_upgradable_body', stack => A.itemId(stack) === base.id);
  let ready = ctx => {
    let body = ctx.source('body'), template = ctx.template();
    return !!body && !body.isEmpty() && !!template && A.itemId(body) === base.id && !!targets[A.itemId(template)];
  };
  let failure = '星界躯体数据无效。';
  AstralTransforms.register('sdbf:astral_container_upgrade', ready,
    ctx => { try { return AstralTransforms.previewItem(U.upgrade(ctx.source('body'), ctx.template())); } catch (error) { return AstralTransforms.failedPreview(failure); } },
    ctx => { try { return AstralTransforms.producedItem(U.upgrade(ctx.source('body'), ctx.template())); } catch (error) { return AstralTransforms.failedProduce(failure); } });
})();
