// 最终修正版 v2 (支持分页)
const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: '肉视频 (最终版 v2)',
    site: 'https://rou.video',
}

// 全局变量，用于“记住”当前浏览的分类URL
let currentCategoryUrl = '';

async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

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

async function getCards(ext) {
    ext = argsify(ext);
    
    // --- 翻页逻辑修正 ---
    // 如果 App 传来的参数包含了 url (说明是第一次加载分类)，就更新我们的“记忆”
    if (ext.url) {
        currentCategoryUrl = ext.url;
    }

    const page = ext.page || 1;

    // 如果记忆是空的（异常情况），就返回空列表
    if (!currentCategoryUrl) {
        return jsonify({ list: [] });
    }

    // 使用“记忆”中的分类URL和 App 传来的页码来构建正确的链接
    const url = `${appConfig.site}${currentCategoryUrl}?page=${page}`;
    
    let cards = [];
    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('.group').each((_, element) => {
        const linkElement = $(element).find('h3').closest('a')
        const href = linkElement.attr('href')

        if (!href) return
        
        const title = linkElement.find('h3').text().trim()
        const cover = $(element).find('img.relative').attr('src')
        const duration = $(element).find('.absolute.bottom-1.left-1').text().trim()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: duration,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)
    
    const jsonData = $('#__NEXT_DATA__').text()
    const pageData = JSON.parse(jsonData)

    const videoId = pageData.props.pageProps.video.id

    const playUrl = `https://v.rn179.xyz/hls/${videoId}/index.m3u8`

    tracks.push({
        name: '播放',
        pan: '',
        ext: {
            url: playUrl,
        },
    })

    return jsonify({
        list: [{ title: '默认分组', tracks }],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    return jsonify({ urls: [url] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/search?q=${text}&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('.group').each((_, element) => {
        const linkElement = $(element).find('h3').closest('a')
        const href = linkElement.attr('href')

        if (!href) return

        const title = linkElement.find('h3').text().trim()
        const cover = $(element).find('img.relative').attr('src')
        const duration = $(element).find('.absolute.bottom-1.left-1').text().trim()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: duration,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}
