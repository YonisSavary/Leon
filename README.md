# Leon - Music Metadata Fetcher ! 

## What is Leon ?

Leon allow you to fetch Metadata ( from [Discogs](https://www.discogs.com/) API ) for your music files **(only .mp3)**
To use this application you'll need a token from Discogs (see [Create App Section](https://www.discogs.com/settings/developers), generate a new token and copy it for later)

## Use of Leon

This application use is divided in 5 major step :

- Token part :
  - Enter your token here, it will be saved locally
  - Also, Leon will check if your token is valid
- Tags seach :
  - Enter an album name, it will look for Master releases on Discogs API
- File selection :
  - Select the directory containing your music files
- Adjustements :
  - From Here you can reoganize your file to match your want
- Tags applying :
  - Confirm this step and Leon will apply tags
   depending on your previous choices

## Fetched Tags

Leon fetch and apply theses tags :
- Release/Album Name 
- Artist Name
- Release Year
- Music Genre
- Album Tracklist
- Album Cover (image)

## Used packages

Leon was made using theses packages:
- `electron` (quick app) :
  - Obviously, to make a desktop app with web technologies
- `got`
  - Used to download an album cover (chosen `got` because `request` is apparently deprecated now)
- `jquery`
  - Mostly used in Leon for sortable lists (at Adjustments step)
- `node-id3`
  - The most important one, used to apply metadata to mp3 files

___

<p align="center">
  <img src="https://user-images.githubusercontent.com/61980378/99157866-18bb2080-26cd-11eb-9094-3fbeb0b70cde.png" width="128" height="128"/>
</p>
