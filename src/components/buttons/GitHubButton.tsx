// tslint:disable-next-line: match-default-export-name no-submodule-imports
import GitHubIcon from '@material-ui/icons/GitHub';
import React from "react";
import IconButtonWithTooltip from '../ui/IconButtonWithTooltip';

export default function GitHubButton(props: { repo: string, size?: "small" | "medium", className?: string }) {
    const { repo, size, className } = props;
    let url = repo;
    if (!/^\//.test(url)
        && !/^https:\/\//.test(url)
        && !/^https:\/\/github.com\//.test(url)) {
        url = "https://github.com/" + url;
    }
    return <IconButtonWithTooltip title={`open ${url}`} className={className}
        to={url} size={size} color="inherit" edge="start">
        <GitHubIcon />
    </IconButtonWithTooltip>;
}