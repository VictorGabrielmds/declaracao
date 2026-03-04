import React from 'react';
import Form from '../assembled/form/form';
import Title from '../components/title/Title';
import Footer from '../components/footer/footer';

function Home() {
  return (
    <div className='d-flex'>
      <div className='w-50 w-100'>
        <div className='va-middle'>
          <Title/>
          <Form/>
          <Footer></Footer>
        </div>
      </div>
      <div className='w-50 w-100 h-50-480'>
        <div className='parent'>
          <div
            className='img-context'
          />
        </div>
      </div>
    </div>
  );
}

export default Home;