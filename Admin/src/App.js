import { Provider } from "react-redux";
import "./App.css";
import Layout from "./components/Layout/Layout";
import storage from "./storage/storage";


function App() {
  return <Provider store={storage}>
    <Layout />;
  </Provider>
}

export default App;
