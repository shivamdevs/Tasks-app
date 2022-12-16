

function Layout({children, ...props}) {
    return (
        <div {...props} style={css} id="layout">{children}</div>
    )
}

export default Layout;

const css = {
    "position": "fixed",
    "inset": "0",
    "overflow": "auto",
};