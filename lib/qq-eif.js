/*
 * Modified version of the package
 * 'Node-QQ-EIF' (https://github.com/momocow/Node-QQ-EIF)
 * by xiyuesaves (https://www.github.com/xiyuesaves)
 */

import path from "path";
import fs from "fs";
import CFB from "./cfb-fixed.js";

const IMG_EXT = [".bmp", ".jpg", ".gif", ".png"];

const EIF = {
  extractImages,
  extract,
  listImages,
  listFiles,
};

function extractImages(src, dst, allow_subdir = true) {
  EIF.extract(src, dst, allow_subdir, IMG_EXT);
}

function extract(src, dst, allow_subdir = true, allowed_exts = []) {
  for (let zipped_file of EIF.listFiles(src, allowed_exts)) {
    let local_path = zipped_file.path.replace(/^Root Entry\//, "");
    if (!allow_subdir) {
      local_path = path.basename(local_path);
    }

    let entry_file = path.join(dst, local_path);
    ensureFileSync(entry_file);
    fs.writeFileSync(entry_file, zipped_file.entry.content || "");
  }
}

function ensureFileSync(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return;
    }
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, "");
  } catch (err) {
    console.error(`Error ensuring file exists: ${err}`);
    throw err;
  }
}

function listImages(src) {
  return EIF.listFiles(src, IMG_EXT);
}

function listFiles(src, allowed_exts = []) {
  let eif = CFB.read(src, { type: "file" });
  let valid_paths = [];
  let valid_content = eif.FileIndex.filter((e, i) => {
    if (e.size > 0) {
      valid_paths.push(eif.FullPaths[i]);
      return true;
    }
    return false;
  });

  let file_list = [];
  for (let idx in valid_content) {
    let entry = valid_content[idx];
    if (entry.type == 2 && (!allowed_exts || allowed_exts.indexOf(path.extname(entry.name)) >= 0)) {
      file_list.push({ path: valid_paths[idx], entry: entry });
    }
  }

  return file_list;
}

export default EIF;
