---
layout: note.njk
title: "React - Render Props & HOC"
date: 2019-01-17
tags:
  - note
  - javascript
  - react
published: true
codepen: https://codepen.io/adambuczek/pen/NeVxWE
---

## Filtering with Render Props and HOC

Render Props and Higher Order Components are ways to build reusable components and avoid data encapsulation in components. This follows the idea of dependency injection.

As an example I implemented table filtering using this patterns. Here is the boilerplate code with Bootstrap 4 classes.

Table component with separate `list` and `headers` props to enable rendering an empty set with only headings.

```jsx
const Table = ({ list, headers }) => {

  const tableHeaders = headers.map((header, i) => (
    <th scope="col" key={i}>{header}</th>
  ))

  const tableRows = list.map((row, i) => (
    <tr key={i}>{
        headers.map((header, j) => (
            <td key={j}>{row[header]}</td>
        ))
    }</tr>
  ))

  return (
    <table className="table table-striped table-borderless">
        <thead className="thead-dark">
            <tr>{tableHeaders}</tr>
        </thead>
        <tbody>{tableRows}</tbody>
    </table>
  )
}
```

Dummy data from [JSONPlaceholder](https://jsonplaceholder.typicode.com/).

```js
const list = fetch('https://jsonplaceholder.typicode.com/users')
    .then(respone => respone.json())
    .then(users => users.map(
        user => ({
            id: user.id, name: user.name,
            username: user.username,
            email: user.email,
            website: user.website,
            city: user.address.city,
        })
    )).catch(e => {
        console.error(e)
    })
```

App component with filter input and unfiltered Table.

```jsx
class App extends React.Component {
  constructor() {
    super()
    this.state = {
        list: [],
        headers: [],
        query: ""
    }
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(event) {
        this.setState({ query: event.target.value })
  }

  componentDidMount() {
    list
      .then(data => {
        this.setState({
            list: data,
            headers: data.length !== 0 ? Object.keys(data[0]) : []
        })
      })
      .catch(e => {
        console.info("Error fetching data")
        console.error(e)
      })
  }

  render() {
    return (
      <span>
        <input
          type="text"
          placeholder="Filter"
          value={this.state.query}
          onChange={this.handleChange}
        />
        <Table
          headers={this.state.headers}
          list={this.state.list}
        />
      </span>
    )
  }
}
```

## Render Props

Filtering with component using a render prop pattern. 

The component gets it's own props and doesn't worry what else anything passed to `render` prop needs.
```js
const ListFilterRenderProp = props => {
    const { list, query, render } = props
    
    const filteredList = list.filter(row =>
        Object.values(row).join(' ').includes(query))
    
    return render(filteredList)
}
```
And I can swap `<Table>` with the code below.
```jsx
<h1>Render Prop:</h1>
<ListFilterRenderProp
    list={this.state.list} query={this.state.query}
    render={
        filtered => (
            <Table headers={this.state.headers} list={filtered}/>
        )
    }
/>
```
The filtered table in App's render contains a literal component so any prop needed from app can be passed here as well. Filter component doesn't have to know anything about how the filtered data is consumed.

Another way of doing this is using function as children which leverages the fact that `children` is a React prop. This is almost the same as the sample above but uses `children` in place of `render`.
```js
const ListFilterChildFunction = props => {
    const { list, query, children } = props
    
    const filteredList = list.filter(row =>
        Object.values(row).join(' ').includes(query))
    
    return children(filteredList)
}
```
Use is also only slightly different.
```jsx
<h1>Children as function:</h1>
<ListFilterChildFunction
    list={this.state.list} query={this.state.query}
>
    {
        filtered => (
            <Table headers={this.state.headers} list={filtered} />
        )
    }
</ListFilterChildFunction>
```
By that logic it is possible to use any prop to achieve the same effect. `render` and `children` are used as a convention. Here is a render prop pattern using `foo` prop.
```js
const ListFilterFooProp = props => {
    const { list, query, foo } = props
    
    const filteredList = list.filter(row =>
        Object.values(row).join(' ').includes(query))
    
    return foo(filteredList)
}
```
```jsx
<h1>Foo Prop:</h1>
<ListFilterFooProp
    list={this.state.list} query={this.state.query}
    foo={
        filtered => (
            <Table headers={this.state.headers} list={filtered} />
        )
    }
/>
```
Here's how it looks in React DevTools:
```jsx
<ListFilterRenderProp query="">
    <Table>...</Table>
</ListFilterRenderProp>
```

## Higher Order Component

HOCs are used to achieve the same goal and are an older pattern. The same filtering can be done this way.
```js
const withFilter = Component => {
  return ({ list, query, ...rest }) => {
    const filteredList = list.filter(row => Object.values(row).join(' ').includes(query))
    return <Component {...rest} list={ filteredList } />
  }
}
const FilteredTable = withFilter(Table)
```
`withFilter` returns a wrapped component with `filteredList` in its scope. Props must be passed explicitly to the wrapped component. To use the HOC I need to create the wrapped component first by passing `Table` to `withFilter` and save the returned component in a variable.

I can be then used like this.
```jsx
<h1>HOC wrapper:</h1>
<FilteredTable list={this.state.list} query={this.state.query} headers={this.state.headers} />
```
`query` and `list` are consumed in the HOC, `headers` are passed down to the `Table`. Components need to be wrapped before use which makes this pattern slightly less convenient than RP but adds readability and forces separation.

This is how it looks in React DevTools:
```jsx
<Unknown query="">
    <Table>...</Table>
</Unknown>
```
This is because wrapper element doesn't have a display name. It is enough to store the component in a variable to give it its name.
```js
const withFilter = Component => {
  const ListFilter = ({ list, query, ...rest }) => {
    const filteredList = list.filter(row => Object.values(row).join(' ').includes(query))
    return <Component {...rest} list={ filteredList } />
  }
  return ListFilter
}
```
```jsx
<ListFilter query="">
    <Table>...</Table>
</ListFilter>
```
Additionally its possible to set up a dynamic name for the wrapper. Conventionally HOC returned components have names of the expression that returned them.

```js
const withFilter = Component => {
    const ListFilter = ({ list, query, ...rest }) => {
        const filteredList = list.filter(row =>
            Object.values(row).join(' ').includes(query))
        return <Component {...rest} list={ filteredList } />
    }
    ListFilter.displayName = `withFilter(${Component.displayName || Component.name})`
    return ListFilter
}
```
```xml
<withFilter(Table) query="">
    <Table>...</Table>
</withFilter(Table)>
```