import { useState, useEffect } from 'react'
import personService from './services/persons'

const Notification = ({ message, type }) => {
  if (message === null) {
    return null
  }

  return (
    <div className={type}>
      {message}
    </div>
  )
}

const Filter = (props) => {
  return (
    <div>
      filter shown with <input
      value={props.name}
      onChange={props.onChange}
      />
  </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
    <div>
      name: <input
      value={props.name}
      onChange={props.handleNameChange}
    />
    </div>
    <div>number: <input 
      value={props.number}
      onChange={props.handleNumberChange}
    />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
  )
}

const Person = (props) => {
  return(
    <div> 
      {props.name} {props.number}
      <button onClick={props.onClick}>Delete</button>
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [searchName, setSearchName] = useState('')
  const [message, setMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  console.log('render', persons.length, 'persons')

  const addPerson = (event) => {
    event.preventDefault()
    const id = () => {
      let i = 1;
      while (persons.some(person => person.id === String(i))) {
        i++;
      }
      return String(i);
    };
    const personObject = {
      name: newName,
      number: newNumber,
      id: id(),
    }

    if(persons.some(person => person.name===newName)) {
      const person = persons.find(n => n.name === personObject.name)
      updateNumber(person, newNumber)
      setNewName('')
      setNewNumber('')
    } else {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setNewName('')
          setNewNumber('')
          setMessage(
            `Added ${personObject.name}`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          console.log(error.response.data.error)
        })
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = (event) => {
    setSearchName(event.target.value)
  }

  const deletePerson = (personObject) => {
    if(window.confirm(`Delete ${personObject.name}?`)){
      personService
        .remove(personObject.id)
        .then(returnedPerson => {
          console.log(returnedPerson)
          setPersons(persons.filter(person => person.id !== personObject.id))
          setMessage(
            `Deleted ${personObject.name}`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
        })
    }
  }

  const updateNumber = (personObject, updatedNumber) => {
    if(window.confirm(`${personObject.name} is already added to phonebook, replace the old number with a new one?`)) {
      const person = persons.find(n => n.id === personObject.id)
      const changedPerson = { ...person, number: updatedNumber}
      personService
        .update(personObject.id, changedPerson)
        .then(returnedPerson => {
         console.log(returnedPerson)
         if(returnedPerson) {
          setPersons(persons.map(person => person.id !== personObject.id ? person : returnedPerson))
          setMessage(
            `Changed ${personObject.name}'s number`
          )
          setTimeout(() => {
            setMessage(null)
          }, 5000)
         } else {
          setErrorMessage(
            `Information of ${personObject.name} has already been removed from server`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setPersons(persons.filter(n => n.id !== personObject.id))
         }
        })
        .catch(error => {
          setErrorMessage(error.response.data.error)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          console.log(error.response.data.error)
        })
    }
}

  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(searchName.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type="message"/>
      <Notification message={errorMessage} type="error"/>
      <Filter name={searchName} onChange={handleSearchChange} />
      <h3>add a new</h3>
      <PersonForm 
        onSubmit={addPerson} name={newName} handleNameChange={handleNameChange}
        number={newNumber} handleNumberChange={handleNumberChange}
      />
      <h3>Numbers</h3>
      {personsToShow.map(person => 
          <Person key={person.id} name={person.name} number={person.number} onClick={() => deletePerson(person)} />
        )}
    </div>
  )
}

export default App