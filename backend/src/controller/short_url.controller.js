import { getShortUrl } from "../dao/short_url.dao.js"
import { createShortUrlWithoutUser, createShortUrlWithUser } from "../services/short_url.service.js"
import wrapAsync from "../utils/tryCatchWrapper.js"
import { AppError } from "../utils/errorHandler.js"

const getAppUrl = () => {
    const appUrl = process.env.APP_URL?.trim()
    if (!appUrl) {
        throw new AppError("Short link domain is not configured. Set APP_URL on the server.", 500)
    }

    return `${appUrl.replace(/\/+$/, "")}/`
}

export const createShortUrl = wrapAsync(async (req,res)=>{
    const appUrl = getAppUrl()
    const data = req.body
    let shortUrl
    if(req.user){
        shortUrl = await createShortUrlWithUser(data.url,req.user._id,data.slug)
    }else{  
        shortUrl = await createShortUrlWithoutUser(data.url,data.slug)
    }
    res.status(200).json({shortUrl : appUrl + shortUrl})
})


export const redirectFromShortUrl = wrapAsync(async (req,res)=>{
    const {id} = req.params
    const url = await getShortUrl(id)
    if(!url) throw new Error("Short URL not found")
    res.redirect(url.full_url)
})

export const createCustomShortUrl = wrapAsync(async (req,res)=>{
    const appUrl = getAppUrl()
    const {url,slug} = req.body
    const shortUrl = await createShortUrlWithoutUser(url,slug)
    res.status(200).json({shortUrl : appUrl + shortUrl})
})