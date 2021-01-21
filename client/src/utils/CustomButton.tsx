import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";

const CustomButton = ({
    children,
    onClick,
    tip,
    btnClassName,
    tipClassName
}: {
    children?: any;
    onClick?: any;
    tip: string;
    btnClassName?: string;
    tipClassName?: string;
}) => (
    <Tooltip title={tip} className={tipClassName} placement="top">
        <IconButton onClick={onClick} className={btnClassName}>
            {children}
        </IconButton>
    </Tooltip>
);

export default CustomButton;
