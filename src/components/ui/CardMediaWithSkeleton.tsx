import { CardMedia, CardMediaProps, createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) => createStyles({
    media: {
        height: 0,
        paddingTop: '75%', // 4:3
    }
}));

/*
        [theme.breakpoints.down('lg')]: {
            paddingTop: '56.72%', // 16:9
        },
        [theme.breakpoints.down('xs')]: {
            paddingTop: '18%',
        },
        [theme.breakpoints.down('md')]: { // 6:3
            paddingTop: '50%',
        }
*/

export default function CardMediaWithSkeleton(props: CardMediaProps) {
    const { image, src, className, ...others } = props;
    const classes = useStyles();
    const hasImage = !!image || !!src;
    return hasImage ?
        <CardMedia className={className || classes.media} {...others} image={image} src={src} />
        : <></>;
}