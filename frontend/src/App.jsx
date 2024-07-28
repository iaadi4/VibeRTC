import {Routes, Route} from 'react-router-dom';
import Landing from './Pages/Landing';
import Room from './Pages/Room';

function App() {

  return (
    <div>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/room/:roomId' element={<Room />} />
      </Routes>
    </div>
  )
}

export default App;
