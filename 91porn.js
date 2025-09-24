const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
}

// APP 配置
async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// 分类
async function getTabs() {
    let list = []
    const { data } = await $fetch.get(appConfig.site, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('select[name="category"] option').each((_, e) => {
        const name = $(e).text().trim()
        const value = $(e).attr('value')
        if (!value) return
        list.push({
            name,
            ext: { url: `https://91porn.com/index.php?category=${value}` },
        })
    })
    return list
}

// 视频列表
async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext
    if (page > 1) url += `&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('table.listtable tr').each((_, e) => {
        const a = $(e).find('a[href*="view_video.php"]')
        if (!a.length) return
        const href = a.attr('href')
        const title = a.text().trim()
        const cover = $(e).find('img').attr('src') || ''
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: { url: 'https://91porn.com/' + href },
        })
    })
    return jsonify({ list: cards })
}

// 播放
async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext.url

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)
    const playUrl = $('video source').attr('src') || $('iframe').attr('src')
    if (playUrl) {
        tracks.push({
            name: '播放',
            pan: '',
            ext: { url: playUrl.startsWith('http') ? playUrl : 'https://91porn.com/' + playUrl },
        })
    }
    return jsonify({ list: [{ title: '默认分组', tracks }] })
}

// 搜索
async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `https://91porn.com/v.php?search=${text}&page=${page}`

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)
    $('table.listtable tr').each((_, e) => {
        const a = $(e).find('a[href*="view_video.php"]')
        if (!a.length) return
        const href = a.attr('href')
        const title = a.text().trim()
        const cover = $(e).find('img').attr('src') || ''
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: { url: 'https://91porn.com/' + href },
        })
    })
    return jsonify({ list: cards })
}

// 播放 URL
async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url], headers: [{ 'User-Agent': UA }] })
}
