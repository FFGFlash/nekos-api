const express = require('express')
const app = express()
const { PORT = 3000, GITHUB_TOKEN } = process.env

const requestOptions = {
  headers: {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${GITHUB_TOKEN}`,
  },
}

function getErrorMessage(err) {
  if (typeof err === 'string') return err
  if (
    typeof err === 'object' &&
    'message' in err &&
    typeof err.message === 'string'
  )
    return err.message
  return 'Unknown Error Occurred'
}

app.get('/github/:user/:repo', async (req, res) => {
  const { user, repo } = req.params
  try {
    const gres = await fetch(
      `https://api.github.com/repos/${user}/${repo}`,
      requestOptions
    )
    const data = await gres.json()
    if (!gres.ok)
      return res
        .status(400)
        .json({ status: gres.status, message: data.message })
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ status: 500, message: getErrorMessage(err) })
  }
})

app.get('/github/:user/:repo/contents', async (req, res) => {
  const { user, repo } = req.params
  const { path = '', branch = 'main' } = req.query
  try {
    const gres = await fetch(
      `https://api.github.com/repos/${user}/${repo}/contents/${path}?ref=${branch}`,
      requestOptions
    )
    const data = await gres.json()
    if (!gres.ok)
      return res
        .status(400)
        .json({ status: gres.status, message: data.message })
    res.status(200).json(data)
  } catch (err) {
    res.status(500).json({ status: 500, message: getErrorMessage(err) })
  }
})

app.get('/github/:user/:repo/:branch', async (req, res) => {
  const { user, repo, branch } = req.params
  const { path = '' } = req.query
  try {
    const gres = await fetch(
      `https://raw.github.com/${user}/${repo}/${branch}/${path}`
    )
    const data = await gres.text()
    if (!gres.ok) return res.status(400).send(data)
    res.status(200).send(data)
  } catch (err) {
    res.status(500).send(`500: ${getErrorMessage(err)}`)
  }
})

app.listen(PORT, () => console.log(`App listening on port ${PORT}`))
