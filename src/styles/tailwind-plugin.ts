// @ts-ignore
import plugin from "tailwindcss/plugin";

/**
 * A Tailwind CSS plugin that adds Notiq's custom theme variables and styles.
 */
export const notiqPlugin = (plugin as any)(function ({ addBase, theme }: any) {
    addBase({
        ':root': {
            '--background': 'oklch(1 0 0)',
            '--foreground': 'oklch(0.145 0 0)',
            '--card': 'oklch(1 0 0)',
            '--card-foreground': 'oklch(0.145 0 0)',
            '--popover': 'oklch(1 0 0)',
            '--popover-foreground': 'oklch(0.145 0 0)',
            '--primary': 'oklch(0.205 0 0)',
            '--primary-foreground': 'oklch(0.985 0 0)',
            '--secondary': 'oklch(0.97 0 0)',
            '--secondary-foreground': 'oklch(0.205 0 0)',
            '--muted': 'oklch(0.97 0 0)',
            '--muted-foreground': 'oklch(0.556 0 0)',
            '--accent': 'oklch(0.97 0 0)',
            '--accent-foreground': 'oklch(0.205 0 0)',
            '--destructive': 'oklch(0.577 0.245 27.325)',
            '--destructive-foreground': 'oklch(0.577 0.245 27.325)',
            '--border': 'oklch(0.922 0 0)',
            '--input': 'oklch(0.922 0 0)',
            '--ring': 'oklch(0.708 0 0)',
            '--radius': '0.625rem',
            '--font-gray': '#9b9a97',
            '--font-brown': '#64473a',
            '--font-orange': '#d9730d',
            '--font-yellow': '#dfab01',
            '--font-green': '#0f7b6c',
            '--font-blue': '#0b6e99',
            '--font-purple': '#6940a5',
            '--font-pink': '#ad1a72',
            '--font-red': '#e03e3e',
            '--background-gray': '#ebeced',
            '--background-brown': '#e9e5e3',
            '--background-orange': '#faebdd',
            '--background-yellow': '#fbf3db',
            '--background-green': '#ddedea',
            '--background-blue': '#ddedea',
            '--background-purple': '#eae4f2',
            '--background-pink': '#f4dfeb',
            '--background-red': '#fbe4e4',
        },
        '.dark': {
            '--background': 'oklch(0.145 0 0)',
            '--foreground': 'oklch(0.985 0 0)',
            '--card': 'oklch(0.145 0 0)',
            '--card-foreground': 'oklch(0.985 0 0)',
            '--popover': 'oklch(0.145 0 0)',
            '--popover-foreground': 'oklch(0.985 0 0)',
            '--primary': 'oklch(0.985 0 0)',
            '--primary-foreground': 'oklch(0.205 0 0)',
            '--secondary': 'oklch(0.269 0 0)',
            '--secondary-foreground': 'oklch(0.985 0 0)',
            '--muted': 'oklch(0.269 0 0)',
            '--muted-foreground': 'oklch(0.708 0 0)',
            '--accent': 'oklch(0.269 0 0)',
            '--accent-foreground:': 'oklch(0.985 0 0)',
            '--destructive': 'oklch(0.396 0.141 25.723)',
            '--destructive-foreground': 'oklch(0.637 0.237 25.331)',
            '--border': 'oklch(0.269 0 0)',
            '--input': 'oklch(0.269 0 0)',
            '--ring': 'oklch(0.439 0 0)',
            '--font-gray': '#9b9a97',
            '--font-brown': '#937264',
            '--font-orange': '#ffa344',
            '--font-yellow': '#ffdc49',
            '--font-green': '#4dab9a',
            '--font-blue': '#529cca',
            '--font-purple': '#9a6dd7',
            '--font-pink': '#e255a1',
            '--font-red': '#ff7369',
            '--background-gray': '#454b4e',
            '--background-brown': '#434040',
            '--background-orange': '#594a3a',
            '--background-yellow': '#59563b',
            '--background-green': '#354c4b',
            '--background-blue': '#364954',
            '--background-purple': '#443f57',
            '--background-pink': '#533b4c',
            '--background-red': '#594141',
        }
    });
}, {
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: {
                    DEFAULT: 'var(--primary)',
                    foreground: 'var(--primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--secondary)',
                    foreground: 'var(--secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--muted)',
                    foreground: 'var(--muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--accent)',
                    foreground: 'var(--accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--destructive)',
                    foreground: 'var(--destructive-foreground)',
                },
                border: 'var(--border)',
                input: 'var(--input)',
                ring: 'var(--ring)',
                card: {
                    DEFAULT: 'var(--card)',
                    foreground: 'var(--card-foreground)',
                },
                popover: {
                    DEFAULT: 'var(--popover)',
                    foreground: 'var(--popover-foreground)',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        }
    }
});
