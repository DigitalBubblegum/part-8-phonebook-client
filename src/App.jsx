import { useState } from 'react'
import { gql,useApolloClient,useQuery } from '@apollo/client'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import Notify from './components/Notify'
import PhoneForm from './components/PhoneForm'
import LoginForm from './components/LoginForm'
const ALL_PERSONS = gql`
query {
  allPersons {
    name
    phone
    id
  }
}
`
const App = () => {
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }
  const result = useQuery(ALL_PERSONS)
  const client = useApolloClient()
  if (result.loading) {
    return (<div>loading</div>)    
  }
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  if(!token){
    return(
      <div>
        <Notify errorMessage= {errorMessage}/>
        <h2>Login</h2>
        <LoginForm setToken={setToken} setError={notify}/>
      </div>
    )
  }
  return(<div>
          <Notify errorMessage={errorMessage} />
          <button onClick={logout}>logout</button>
          <Persons persons={result.data.allPersons} />
          <PersonForm setError={notify}/>
          <PhoneForm setError={notify} />
        </div>)
}
export default App
