'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleGoHome = () => {
    window.location.href = '/';
  };
  return (
    <html>
      <body>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            height: '100vh',
            gap: '1rem',
            flexDirection: 'column',
            padding: '5rem',
            marginTop: '5rem',
          }}
        >
          <h1>Uh Oh!</h1>
          <p>The application has experienced an unrecoverable error!! 😭😭</p>
          <p>Here is the error message:</p>
          <code>{error.message}</code>
          <code>{error.stack}</code>
          <code>{error.digest}</code>
          <hr style={{ width: '100%', borderTop: '1px solid black' }} />
          <p>Here are some things you can try:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p>
              Please report the error{' '}
              <a href='https://github.com/raffles-interact/interapp/issues'>here</a>, or if you
              don't have a GitHub account, reach out to the relevant people. Please include a
              description of how you produced this error, as well as the error message shown above.
            </p>
            <button onClick={reset}>Attempt to recover</button>
            <button onClick={handleGoHome}>Go Home</button>
          </div>
        </div>
      </body>
    </html>
  );
}
