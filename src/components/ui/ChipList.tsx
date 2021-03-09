import { createStyles, makeStyles, Theme } from "@material-ui/core";
import React from "react";

const useStyles = makeStyles((theme: Theme) => createStyles({
  root: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    '& > *': {
      margin: theme.spacing(0.5),
    },
  },
}),
);

export default function ChipList(props: {
  children: any[]
}) {
  const { children } = props;
  const classes = useStyles();

  if (!children?.length)
    return null;

  return <span className={classes.root}>
    {children}
  </span>
}