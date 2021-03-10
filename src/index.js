const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
var validate = require('uuid-validate')
const app = express()

app.use(cors())
app.use(express.json())

 const users = []

function checksExistsUserAccount(request, response, next) {
  const { username }  = request.headers
  const user = users.find( user => user.username === username)
  if(user) {
    request.user = user
    return next()
  }
  else {
    response.status(400)
  }

}
function checkUsername(request, response, next){
  const { username } = request.body
  const user = users.some((user) => user.username === username)
  if(user) {
    response.status(400).json({
      error: 'Mensagem do erro'
    })
  }
  next()
}
function checksExistsTodo(request, response , next) {
  const { id } = request.params
  const { user }  = request
  const todo = user.todos.find((todo) => todo.id === id)
  if(!todo) {
    response.status(404).json({
      error: 'Mensagem do erro'
    })
  }
  return next()
}
app.post('/users', checkUsername, (request, response) => {
  const id = uuidv4()
  const {  name , username } = request.body
  if(name && username) {
    const newUser = {
      id : id,
      name : name,
      username: username,
      todos: []
    }
    users.push(newUser);
    response.status(201).json(newUser)
  }
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.json(user.todos)
})

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const id = uuidv4()
  const { title , deadline } = request.body
  newTodo = {
    id,
    title,
    done : false,
    deadline : new Date(deadline),
    created_at : new Date()
  }
  user.todos.push(newTodo)
  response.status(201).json(newTodo)
})

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  const { user } = request
  const { title , deadline } = request.body
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  todo.title = title
  todo.deadline = deadline
  response.status(201).json(todo)
  
})

app.patch('/todos/:id/done', checksExistsUserAccount,checksExistsTodo, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  todo.done = true
  response.status(200).json(todo)
})

app.delete('/todos/:id', checksExistsUserAccount,checksExistsTodo, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  user.todos.splice(todo.id,1)
  return response.status(204).send()
})

module.exports = app