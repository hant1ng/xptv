// 来自群友“tou tie”的脚本，由Gemini修正
const cheerio = createCheerio()

// 设置User Agent
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

// 基础配置
let appConfig = {
    ver: 1,
    title: '肉视频 (修正版)',
    site: 'https://rou.video',
}

// 获取配置和分类
async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// 获取所有分类标签
async function getTabs() {
    let list = []
    const { data } = await $fetch.get(`${appConfig.site}/home`, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    // 修正: 使用我们之前分析得出的正确选择器
    $('.space-y-8 a').each((_, e) => {
        const name = $(e).text().trim()
        const href = $(e).attr('href')
        if (href && name) {
            list.push({
                name,
                ui: 1,
                ext: {
                    // 修正: ext 中应传递 typeurl 给 getCards
                    typeurl: href,
                },
            })
        }
    })
    return list
}

// 获取指定分类下的视频列表
async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    // 修正: 从 ext 中获取 typeurl 和 page
    let { page = 1, typeurl } = ext

    // 修正: 根据我们分析出的正确分页规则拼接 URL
    const url = `${appConfig.site}${typeurl}?page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    // 修正: 使用我们之前分析得出的正确卡片选择器 .group
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
            vod_remarks: duration, // 使用 remarks 字段显示时长
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

// 获取视频的播放地址 (m3u8)
async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    // 修正: 这是最关键的修正，采用从 __NEXT_DATA__ 获取ID的正确逻辑
    const url = ext.url // 这是详情页的完整URL

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)
    
    // 1. 直接选择那个包含所有数据的 JSON 块
    const jsonData = $('#__NEXT_DATA__').text()
    const pageData = JSON.parse(jsonData)

    // 2. 从解析后的数据中获取视频 ID
    const videoId = pageData.props.pageProps.video.id

    // 3. 尝试拼接出基础的 m3u8 链接 (注意：可能因缺少签名而无法播放)
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

// 最终播放信息处理
async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    // 修正: 直接返回 m3u8 地址，让播放器去尝试播放
    return jsonify({ urls: [url] })
}

// 搜索功能
async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    // 修正: 搜索URL格式确认
    let url = `${appConfig.site}/search?q=${text}&page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    // 修正: 搜索结果页同样使用 .group 选择器
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
