// ----------- 调试专用脚本 -----------
const cheerio = createCheerio()
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: 'Rou Video (调试中)',
    site: 'https://rou.video',
}

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// getTabs 函数是正确的，我们保持不变
async function getTabs() {
    let list = []
    const { data } = await $fetch.get(`${appConfig.site}/home`, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)
    $('.space-y-8 a').each((_, e) => {
        const name = $(e).text().trim()
        const href = $(e).attr('href')
        if (href && name) {
            list.push({
                name,
                ui: 1,
                ext: {
                    url: href,
                },
            })
        }
    })
    return list
}

// 这是一个临时的、用于调试的 getCards 函数
async function getCards(ext) {
    // --- 调试代码开始 ---
    // 将 App 传过来的 ext 参数转换成字符串，方便查看
    const debugInfo = `收到的ext是: ${JSON.stringify(ext)}`;
    // 我们不执行真正的抓取，而是直接返回这个调试信息
    // 这样，调试信息就会显示在App的视频列表里
    return jsonify({
        list: [{
            vod_id: 'debug_info',
            vod_name: debugInfo, // 用标题字段来显示调试信息
            vod_pic: '',
            vod_remarks: '请把这个标题截图或复制给我',
        }]
    });
    // --- 调试代码结束 ---
}

// --- 其他函数暂时用不到，先放空 ---
async function getTracks(ext) { return jsonify({ list: [] }) }
async function getPlayinfo(ext) { return jsonify({ urls: [] }) }
async function search(ext) { return jsonify({ list: [] }) }
