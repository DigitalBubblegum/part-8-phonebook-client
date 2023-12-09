import { useState } from 'react'
import { gql,useApolloClient,useQuery, useSubscription } from '@apollo/client'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import Notify from './components/Notify'
import PhoneForm from './components/PhoneForm'
import LoginForm from './components/LoginForm'
import { PERSON_ADDED } from './queries'
const ALL_PERSONS = gql`
query {
  allPersons {
    name
    phone
    id
  }
}
`
// function that takes care of manipulating cache
export const updateCache = (cache, query, addedPerson) => {
  // helper that is used to eliminate saving same person twice
  const uniqByName = (a) => {
    let seen = new Set()
    return a.filter((item) => {
      let k = item.name
      return  seen.has(k) ? false : seen.add(k)
    })
  }

  cache.updateQuery(query, ({ allPersons }) => {
    return {
      allPersons: uniqByName(allPersons.concat(addedPerson)),
    }
  })
}
const App = () => {
  useSubscription(PERSON_ADDED,{
    onData: ({data,client}) => {
      const addedPerson = data.data.personAdded
      notify(`${addedPerson.name} added`)
      console.log('subscription block',data)
      updateCache(client.cache, { query: ALL_PERSONS }, addedPerson)
    }
  })
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
