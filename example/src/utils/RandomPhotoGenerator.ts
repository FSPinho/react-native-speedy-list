const PHOTOS = [require("../assets/user.png")]

export default {
    generate,
}

function generate(count: number): Array<string> {
    const photos: Array<string> = []

    for (let i = 0; i < count; i++) {
        photos.push(PHOTOS[Math.floor(Math.random() * PHOTOS.length)])
    }

    return photos
}
