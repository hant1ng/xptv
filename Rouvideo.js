const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

let appConfig = {
    ver: 1,
    title: '肉视频',
    site: 'https://rou.video',
}

async function getConfig() {
    let config = appConfig
    // 手动写死几个常见分类
    config.tabs = [
        { name: '糖心Vlog', ext: { id: '糖心Vlog' } },
        { name: 'MDX', ext: { id: 'MDX' } },
        { name: '91制片厂', ext: { id: '91制片厂' } },
    ]
    return jsonify(config)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, id } = ext

    let url = `${appConfig.site}/t/${id}?order=createdAt&page=${page}`

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)

    $('.group.relative').each((_, element) => {
        const a = $(element).find('a').first()
        const href = a.attr('href')
        const title = $(element).find('h3').text().trim()
        const cover = $(element).find('img').attr('src')
        const remarks = $(element).find('.absolute.bottom-1.left-1').text().trim() // 时长
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: remarks,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({ list: cards })
}

async function getTracks(ext) {
    ext = argsify(ext)
    const url = ext.url
    // 提取 ID
    const vid = url.match(/\/v\/([^/]+)/)[1]
    // 占位：旧版是 /api/v/{id}，但需要你帮忙确认
    let playUrl = `${appConfig.site}/api/v/${vid}`

    return jsonify({
        list: [
            {
                title: '默认',
                tracks: [
                    {
                        name: '播放',
                        pan: '',
                        ext: { url: playUrl },
                    },
                ],
            },
        ],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url
    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const result = argsify(data)

    // 旧版字段是 result.video.videoUrl
    const playurl = result.video ? result.video.videoUrl : ''

    return jsonify({
        urls: [playurl],
        headers: [{ 'User-Agent': UA, Referer: appConfig.site }],
    })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []
    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/search?q=${text}&t=&page=${page}`

    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data)

    $('.group.relative').each((_, element) => {
        const a = $(element).find('a').first()
        const href = a.attr('href')
        const title = $(element).find('h3').text().trim()
        const cover = $(element).find('img').attr('src')
        const remarks = $(element).find('.absolute.bottom-1.left-1').text().trim()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: remarks,
            ext: {
                url: appConfig.site + href,
            },
        })
    })

    return jsonify({ list: cards })
}
