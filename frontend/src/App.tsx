import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { Navbar } from './components/layout/Navbar';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main style={{ flex: 1 }}>
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}

export default App;