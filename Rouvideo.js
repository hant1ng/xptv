// 最终版 v4 (遵照官方文档)
const cheerio = createCheerio()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

const appConfig = {
    ver: 1,
    title: '肉视频 (文档版)',
    site: 'https://rou.video',
}

async function getConfig() {
    const config = appConfig
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
                    url: href, // 文档规范：将分类信息放入 ext，供 getCards 使用
                },
            })
        }
    })
    return list
}

async function getCards(ext) {
    ext = argsify(ext);
    
    // 文档规范：App 会自动将分类 ext 和 page 合并后传来
    const { page = 1, url: typeurl } = ext;
    
    if (!typeurl) {
        // 如果没有分类 url，说明出错了，返回空
        return jsonify({ list: [] });
    }

    const url = `${appConfig.site}${typeurl}?page=${page}`;
    
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
                url: appConfig.site + href, // 文档规范：将详情页信息放入 ext，供 getTracks 使用
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
            url: playUrl, // 文档规范：将播放链接放入 ext，供 getPlayinfo 使用
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
    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `${appConfig.site}/search?q=${text}&page=${page}`

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
