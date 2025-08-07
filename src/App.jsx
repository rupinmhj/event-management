import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Signup } from './Pages/Signup'
import { Signin } from './Pages/Signin'
import Main from './Pages/Main'
const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />
  },
  {
    path: '/signin',
    element: <Signin />
  },
  {
    path: '/signup',
    element: <signup />
  }
])
const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
