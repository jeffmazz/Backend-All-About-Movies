require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fetch = require('node-fetch')
const app = express()
app.use(express.json())
app.use(cors())

const port = process.env.PORT || 3001

const apiKey = process.env.API_KEY

if(!apiKey) {
    console.error('API Key não encontrada')
    process.exit(1)
}

const options = {
    method: "GET",
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.API_KEY}`
    }
}

const fetchData = async(url, res) => {
    try {
        const response = await fetch(url, options)
        if(!response.ok) throw new Error("Erro na requisição à API do TMDB")
        const data = await response.json()
        const originalArray = data.results

        const filteredArray = originalArray.map(item => ({
            id: item.id,
            backdrop_path: item.backdrop_path,
            poster_path: item.poster_path,
            profile_path: item.profile_path,
            title: item.title,
            name: item.name,
            original_title: item.original_title,
            original_name: item.original_name,
            overview: item.overview,
            vote_average: item.vote_average,
            vote_count: item.vote_count,
            release_date: item.release_date,
            first_air_date: item.first_air_date,
            known_for: item.known_for?.map(item => ({
                id: item.id,
                name: item.name,
                title: item.title,
                original_title: item.original_title,
                vote_average: item.vote_average,
            })),
            popularity: item.popularity
        }))

        res.json(filteredArray)

    } catch(error) {
        console.error("Error:", error)
        return res.status(500).json({error: error.message})
    }
}

app.get('/', (req, res) => {
    res.send('Hello, World!')
})

app.get('/movies/top', async (req, res) => {
    const url = 'https://api.themoviedb.org/3/movie/top_rated?language=en-US&page=1'
    await fetchData(url, res)
})

app.get('/movies/popular', async(req, res) => {
    const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1'
    await fetchData(url, res)
})

app.get('/series/top', async(req, res) => {
    const url = 'https://api.themoviedb.org/3/tv/top_rated?language=en-US&page=1'
    await fetchData(url, res)
})

app.get('/series/popular', async(req, res) => {
    const url = 'https://api.themoviedb.org/3/tv/popular?language=en-US&page=1'
    await fetchData(url, res)
})

app.get('/actors', async(req, res) => {

    try {
        const response = await fetch('https://api.themoviedb.org/3/person/popular?language=en-US&page=1', options)
        const data = await response.json()
        const originalArray = data.results
        const filteredArray = originalArray.map(item => ({
            id: item.id,
            profile_path: item.profile_path,
            name: item.name,
            known_for: item.known_for?.map(item => ({
                id: item.id,
                name: item.name,
                title: item.title,
                original_title: item.original_title,
                vote_average: item.vote_average,
            })),
            popularity: item.popularity
        }))
        
        return res.status(200).json(filteredArray)
    } catch (err) {
        console.error(err)
        return res.status(500).json({error: "Falha ao buscar dados"})
    }

})

app.post('/search', async(req, res) => {
    const searchTerm = req.body.query
    if(!searchTerm || searchTerm.trim() === '') return res.status(400).json({error: "O termo de pesquisa é obrigatório."})
    
    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

    const url = `https://api.themoviedb.org/3/search/multi?query=${encodedSearchTerm}&include_adult=false&language=en-US&page=1`
    await fetchData(url, res)
})

app.get('/genre/:id', async(req, res) => {

    const id = req.params.id
    if(!id || isNaN(id)) return res.status(400).json({error: "Gênero do filme inválido ou não informado"})
    
    try {
        const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${id}`, options)
        const data = await response.json()
        const originalArray = data.results
        const filteredArray = originalArray.map(item => ({
            id: item.id,
            poster_path: item.poster_path
        }))
        return res.status(200).json(filteredArray)
    } catch(err) {
        console.error(err)
        return res.status(500).json({error: 'Falha ao buscar dados'})
    }
    
})

export default (req, res) => {
    app(req, res);  // Chama o app express para processar a requisição
}