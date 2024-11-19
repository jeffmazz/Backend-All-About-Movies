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
        Authorization: `Bearer ${apiKey}`
    }
}

const fetchData = async(url, res) => {
    try {
        const response = await fetch(url, options)
        if(!response.ok) throw new Error("Erro na requisição à API do TMDB")
        const data = await response.json()
        res.json(data)
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
    const url = 'https://api.themoviedb.org/3/person/popular?language=en-US&page=1'
    await fetchData(url, res)
})

app.post('/search', async(req, res) => {
    const searchTerm = req.body.query
    if(!searchTerm || searchTerm.trim() === '') return res.status(400).json({error: "O termo de pesquisa é obrigatório."})
    
    const encodedSearchTerm = encodeURIComponent(searchTerm.trim());

    const url = `https://api.themoviedb.org/3/search/multi?query=${encodedSearchTerm}&include_adult=false&language=en-US&page=1`
    await fetchData(url, res)
})

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port} `)
})