type NavbarRowProps = {
    text: string;
};

const NavbarRow = ({ text }: NavbarRowProps) => (
    <div className="p-2">{text}</div>
);

const items = [{ text: 'Ceejus' }, { text: 'Text' }, { text: 'Text 2' }];

const Navbar = () => (
    <div className="flex h-full min-w-max flex-col bg-red-600 p-2">
        {items.map((item) => (
            <NavbarRow text={item.text} />
        ))}
    </div>
);

export default Navbar;
