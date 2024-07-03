import React from 'react';  
import ReactDOM from 'react-dom/client';  
import { DeliveryTaskList } from './component/DeliveryTaskList'
 
const root = ReactDOM.createRoot(document.getElementById('root'));  
root.render(  
  <React.StrictMode>  
    <DeliveryTaskList />  
  </React.StrictMode>  
);