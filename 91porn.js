const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '91Porn',
    site: 'https://91porn.com/index.php',
}

// 获取 APP 配置
async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// 动态抓取分类/标签
async function getTabs() {
    let list = []
    const { data } = await $fetch.get(appConfig.site, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    // 分类位于页面左侧或顶部菜单
    $('.category a, .topbar a').each((_, e) => {
        const name = $(e).text().trim()
        const href = $(e).attr('href')
        if (!name || !href || name.toLowerCase().includes('welcome')) return

        list.push({
            name,
            ext: { url: encodeURI('https://91porn.com/' + href) },
        })
    })

    return list
}

// 获取视频列表（首页、分类、搜索）
async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, url } = ext

    // 翻页处理
    if (page > 1 && url.includes('index.php')) {
        url = url.replace('.php', `.php?page=${page}`)
    } else if (page > 1 && url.includes('?')) {
        url += `&page=${page}`
    }

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    // 视频条目解析
    $('div.listchannel, .video-item, .thumb').each((_, element) => {
        const href = $(element).find('a').attr('href')
        const title = $(element).find('a').attr('title') || $(element).find('a').text()
        const cover = $(element).find('img').attr('src') || $(element).find('img').attr('data-src')
        if (!href || !title) return

        cards.push({
            vod_id: href,
            vod_name: title.trim(),
            vod_pic: cover,
            vod_remarks: '',
            ext: { url: 'https://91porn.com/' + href },
        })
    })

    return jsonify({ list: cards })
}

// 获取视频播放信息
async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext.url

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    // 尝试抓取 video src
    const playUrl = $('video source').attr('src') || $('iframe').attr('src')
    if (playUrl) {
        tracks.push({
            name: '播放',
            pan: '',
            ext: { url: playUrl.startsWith('http') ? playUrl : 'https://91porn.com/' + playUrl },
        })
    }

    return jsonify({
        list: [{ title: '默认分组', tracks }],
    })
}

// 搜索功能
async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `https://91porn.com/v.php?search=${text}&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('div.listchannel, .video-item, .thumb').each((_, element) => {
        const href = $(element).find('a').attr('href')
        const title = $(element).find('a').attr('title') || $(element).find('a').text()
        const cover = $(element).find('img').attr('src') || $(element).find('img').attr('data-src')
        if (!href || !title) return

        cards.push({
            vod_id: href,
            vod_name: title.trim(),
            vod_pic: cover,
            vod_remarks: '',
            ext: { url: 'https://91porn.com/' + href },
        })
    })

    return jsonify({ list: cards })
}

// 获取播放 URL（APP 使用）
async function getPlayinfo(ext) {
    ext = argsify(ext)
    return jsonify({ urls: [ext.url], headers: [{ 'User-Agent': UA }] })
}
