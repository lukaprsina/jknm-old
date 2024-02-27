"use server"

import { read_article } from "../../actions";
import EditorClient from "./editor_client";
import { withParamValidation } from "next-typesafe-url/app/hoc";
import type { InferPagePropsType } from "next-typesafe-url";
import { Route, type RouteType } from "./routeType";

type PageProps = InferPagePropsType<RouteType>;

async function EditorServer({ routeParams }: PageProps) {
    const response = await read_article({ url: routeParams.article_url })

    return (
        <EditorClient article={response.data} />
    )
}


export default withParamValidation(EditorServer, Route);