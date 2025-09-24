const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 1,
    title: '麻豆社',
    site: 'https://hongkongdollvideo.com',
}

// 获取配置，包括分类 tabs
async function getConfig() {
    let config = appConfig
    config.tabs = await getTabs()
    return jsonify(config)
}

// 获取分类 tabs
async function getTabs() {
    let list = []
    let ignore = ['亚洲成人视频']
    function isIgnoreClassName(className) {
        return ignore.some((element) => className.includes(element))
    }

    const { data } = await $fetch.get(appConfig.site, {
        headers: { 'User-Agent': UA },
    })
    const $ = cheerio.load(data)

    $('.scrollbar a').each((_, e) => {
        const name = $(e).text().trim()
        const href = $(e).attr('href')
        if (isIgnoreClassName(name) || !href) return

        list.push({
            name,
            ext: { url: encodeURI(href) },
        })
    })

    return list
}

// 获取视频列表
async function getCards(ext) {
    ext = argsify(ext)
    let { page = 1, url } = ext
    if (!url) return jsonify({ list: [] })
    if (page > 1) url = url + page + '.html'

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)
    let cards = []

    $('.video-item').each((_, el) => {
        const href = $(el).find('.thumb a').attr('href')
        const title = $(el).find('.thumb a').attr('title')
        const cover = $(el).find('.thumb img').attr('data-src')
        const subTitle = $(el).find('.duratio').text().trim()
        if (!href) return
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: { url: href },
        })
    })

    return jsonify({ list: cards })
}

// 获取视频播放信息（解决灰色按钮）
async function getTracks(ext) {
    ext = argsify(ext)
    let url = ext.url
    if (!url) return jsonify({ list: [] })
    if (url.startsWith('/')) url = appConfig.site + url

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)
    let paramScript = $('script:contains(__PAGE_PARAMS__)').text()
    let playUrl = ''

    try {
        const match = paramScript.match(/var __PAGE_PARAMS__="(.+?)"/)
        if (match && match[1]) {
            const decoded = decodeURIComponent(match[1])
            const pageConfig = JSON.parse(decoded)
            if (pageConfig?.player?.param?.url) {
                playUrl = pageConfig.player.param.url
            } else if (pageConfig?.player?.param?.videos?.length > 0) {
                playUrl = pageConfig.player.param.videos[0].url
            }
        }
    } catch (e) {
        $print('getTracks 解码失败', e)
    }

    if (!playUrl) playUrl = url

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks: [{ name: '播放', pan: '', ext: { url: playUrl } }],
            },
        ],
    })
}

// 返回播放地址
async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    return jsonify({ urls: [url], headers: [{ 'User-Agent': UA }] })
}

// 搜索功能
async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/search/${text}/${page}.html`

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)

    $('.video-item').each((_, el) => {
        const href = $(el).find('.thumb a').attr('href')
        const title = $(el).find('.thumb a').attr('title')
        const cover = $(el).find('.thumb img').attr('data-src')
        const subTitle = $(el).find('.duratio').text().trim()
        if (!href) return
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: { url: href },
        })
    })

    return jsonify({ list: cards })
}
