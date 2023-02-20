import './App.css';
import Sidebar from './Sidebar';
import Chat from './Chat';
import Home from './Home';
import Login from './Login';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserName } from './features/user/userSlice';

function App() {
  const userName = useSelector(selectUserName);

  return (
    <div className="app">
      {userName ? (
        <div className="app__body">
          <BrowserRouter>
            <Sidebar />

            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms/:roomId/:seedPrivate" element={<Chat />} />
            </Routes>
          </BrowserRouter>
        </div>
      ) : (
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      )}
    </div>
  );
}

export default App;
