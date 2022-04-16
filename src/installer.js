const setupConfig = {
  // 代码源地址
  github:
    "https://raw.githubusercontent.com/huige233/bitburner-auto-scripts/main/src",
  // 模块配置，后续在这里追加其他模块配置
  modules: [
    {
      enable: true,
      name: 'Hack模块',
      folder: "hack",
      files: [
        // 普通串行Hack脚本
        "normal-hack.js",
        // 动态Hack系列脚本
        "analyze-hack.js",
        "hack-loop.js",
        "do-hack.js",
        "do-grow.js",
        "do-weaken.js"
      ]
    },
    {
      enable: true,
      name: "工具集",
      folder: "tools",
      files: [
        // 购买服务器
        "buy-server.js",
        // 快速执行动态Hack
        "run-analyze-hack.js",
        // 扫描并批量部署Normal Hack
        "scan-deploy-normal-hack.js"
      ]
    },
  ],
};

/** @param {NS} ns **/
export async function main(ns) {

  if (ns.getHostname() !== 'home') {
    throw "⚠ 脚本只能从home执行";
  }

  const success = await downloadFiles(ns);
  if (!success) {
    log("下载脚本文件失败，请检查网络环境，稍候重试");
    return;
  }
}

/**
 * 下载各模块文件
 * 
 * @param {NS} ns
 */
async function downloadFiles(ns) {

  const log = createLogger(ns, '下载');
  log("准备下载脚本文件，请稍候...");

  var count = 0;
  var retry = 0;
  const list = [];
  // 读取所有需要下载的文件
  for (const mod of setupConfig.modules) {
    if (!mod.enable || mod.files.length === 0) continue;
    for (const file of mod.files) {
      list.push({
        url: `${setupConfig.github}/${mod.folder}/${file}`,
        path: `/${mod.folder}/${file}`,
        module: mod.name,
        success: false,
      });
    }
  }

  log(`总计${list.length}个文件需要下载`);
  do {
    retry > 0 && log(`下载重试，第${retry+1}次`);
    for (const file of list) {

      if (file.success) continue;

      log(`开始下载模块(${file.module})，下属文件(${file.path})，[${count+1} / ${list.length}]`);
      const success = await ns.wget(file.url, file.path);
      if (success) {
        log(`😁 文件${file.path}下载成功`);
        count++;
        file.success = true;
      }
      else {
        log(`😡 文件${file.path}下载失败`);
      }
    }

    // 下载完成
    if (count === list.length) break;
    // 重试仍然失败
    if (++retry >= 3) break;
    await ns.sleep(1000);
  } while(count != list.length);

  return count === list.length;
}

/**
 * Logger
 * 
 * @param {NS} ns
 * @param {string} name
 */
function createLogger(ns, name) {
  return (msg) => {
    ns.tprintf(`[${name}]：${msg}`);
  };
}