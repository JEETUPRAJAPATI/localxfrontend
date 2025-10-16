// customFontIcon.js

export const LockIcon = (props) => (
  <svg
    aria-hidden='true'
    focusable='false'
    data-prefix='fas'
    data-icon='lock'
    className='svg-inline--fa fa-lock'
    role='img'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 448 512'
    {...props} // Spread any other passed props to the svg
  >
    <path
      fill='none'
      stroke='currentColor'
      strokeWidth='32'
      d='M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z'
    />
  </svg>
);

export const KeyIcon = (props) => (
  <svg
    aria-hidden='true'
    focusable='false'
    data-prefix='fas'
    data-icon='key'
    className='svg-inline--fa fa-key'
    role='img'
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 0 512 512'
    {...props} // Spread any other passed props to the svg
  >
    <path
      fill='none'
      stroke='currentColor'
      strokeWidth='32'
      d='M336 352c97.2 0 176-78.8 176-176S433.2 0 336 0S160 78.8 160 176c0 18.7 2.9 36.8 8.3 53.7L7 391c-4.5 4.5-7 10.6-7 17l0 80c0 13.3 10.7 24 24 24l80 0c13.3 0 24-10.7 24-24l0-40 40 0c13.3 0 24-10.7 24-24l0-40 40 0c6.4 0 12.5-2.5 17-7l33.3-33.3c16.9 5.4 35 8.3 53.7 8.3zM376 96a40 40 0 1 1 0 80 40 40 0 1 1 0-80z'
    ></path>
  </svg>
);
