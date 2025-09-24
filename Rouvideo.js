// ----------- 调试 getTabs 专用脚本 -----------
const cheerio = createCheerio()
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: 'Rou Video (调试中)',
    site: 'https://rou.video',
}

// 全局变量，用于“记住”当前浏览的分类URL
// 为了测试，我们先暂时移除它，看看是不是它的问题
// let currentCategoryUrl = '';

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// 这是一个临时的、用于调试的 getTabs 函数
async function getTabs() {
    // --- 调试代码开始 ---
    // 我们不访问网站，而是直接返回一个假的分类
    // 用来测试App是否能正常加载和显示分类列表
    return [{
        name: '--- 如果你能看到这个分类，请告诉我 ---',
        ui: 1,
        ext: {
            url: '/t/debug-test', // 随便给一个链接
        },
    }];
    // --- 调试代码结束 ---
}

// --- 其他函数暂时用不到，先放空 ---
async function getCards(ext) { return jsonify({ list: [] }) }
async function getTracks(ext) { return jsonify({ list: [] }) }
async function getPlayinfo(ext) { return jsonify({ urls: [] }) }
async function search(ext) { return jsonify({ list: [] }) }
