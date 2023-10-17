type NavbarRowProps = {
    text: string;
};

const NavbarRow = ({ text }: NavbarRowProps) => (
    <div className="py-2 pl-2 pr-6">{text}</div>
);

const items = [{ text: 'Ceejus' }, { text: 'Home' }, { text: 'Configuration' }];

const Navbar = () => (
    <div className="flex h-full min-w-max flex-col bg-gray-700 p-2 text-white">
        {items.map((item) => (
            <NavbarRow text={item.text} />
        ))}
    </div>
);

export default Navbar;
