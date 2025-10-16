import './css/app-loader.css';

const AppLoader = () => {
  return (
    <section className='app-loader'>
      <div className='bouncing-loader'>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </section>
  );
};

export default AppLoader;
