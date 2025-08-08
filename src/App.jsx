import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Signup } from './Pages/Signup'
import { Signin } from './Pages/Signin'
import Main from './Pages/Main'
import Setup from './Pages/Setup'
import Dashboard from './Pages/Dashboard'
const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />
  },
  {
    path: '/setup-profile',
    element: <Setup />
  },
  {
    path:'/dashboard',
    element: <Dashboard />
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
