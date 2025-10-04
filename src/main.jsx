import { StrictMode } from 'react';
import "@fontsource/poppins/100.css";
import "@fontsource/poppins/200.css";
import "@fontsource/poppins/300.css";
import "@fontsource/poppins/400.css";  // regular
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/poppins/900.css";
// import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx';
import { GeneralProvider } from './context/GeneralContext.jsx';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider >
      {/* <ThemeProvider> */}
      <GeneralProvider>

        <App />
      </GeneralProvider>
      {/* </ThemeProvider> */}
    </AuthProvider>
  </StrictMode>,
)
