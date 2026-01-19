import * as React from 'react';
if (typeof globalThis !== 'undefined') {
    globalThis.React = React;
} else if (typeof window !== 'undefined') {
    window.React = React;
} else if (typeof global !== 'undefined') {
    global.React = React;
}
export { React };
