"use client";

import { useMediaQuery } from "~/hooks/use_media_query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useEffect, useState } from "react";
import { PublishForm } from "./publish_form";
import { SaveArticleType } from "~/server/data_layer/articles";
import { Article } from "@prisma/client";
import { useRouteParams, useSearchParams } from "next-typesafe-url/app";
import { useRouter } from "next/navigation";
import { Route } from "./routeType";

type PublishDrawerProps = {
  save_content: () => string | undefined;
  configure_article: (forced_title: string | undefined, forced_url: string | undefined, published: boolean) => void;
  imageUrls: string[];
  title: string;
  articleId: number;
  content: string;
  url: string;
  published: boolean;
};

export function PublishDrawer({
  imageUrls,
  articleId,
  content,
  title,
  url,
  published,
  save_content,
  configure_article
}: PublishDrawerProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const routeParams = useRouteParams(Route.routeParams);
  const [newUrlAfterReload, setNewUrlAfterReload] = useState<string | undefined>(undefined);
  // the component rerenders if the article changes!!

  const localstorage_open_settings = () => {
    const nastavitve_string = localStorage.getItem("nastavitve")
    if (!nastavitve_string) return
    const nastavitve = JSON.parse(nastavitve_string) as boolean
    localStorage.setItem("nastavitve", JSON.stringify(false))
    if (nastavitve) setDrawerOpen(true)
  }

  if (newUrlAfterReload === routeParams.data?.novica_name) {
    localstorage_open_settings()
  }

  const onOpenSettings = () => {
    const new_url = save_content()

    if (new_url == routeParams.data?.novica_name) {
      setNewUrlAfterReload(undefined)
      setDrawerOpen(true)
    } else {
      setNewUrlAfterReload(new_url)
      localStorage.setItem("nastavitve", JSON.stringify(true))
    }
  }

  if (isDesktop) {
    return (
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Button
          onClick={() => onOpenSettings()}
          variant="outline"
        >
          Nastavitve novičke
        </Button>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nastavitve novičke</DialogTitle>
            <DialogDescription>Uredi in objavi novičko</DialogDescription>
          </DialogHeader>
          <PublishForm
            imageUrls={imageUrls}
            article_id={articleId}
            content={content}
            configure_article={configure_article}
            title={title}
            url={url}
            published={published}
            setDrawerOpen={setDrawerOpen}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
      <Button
        onClick={() => onOpenSettings()}
      >
        Nastavitve novičke
      </Button>
      <DrawerTrigger asChild>
        <Button variant="outline">Nastavitve novičke</Button>
      </DrawerTrigger>
      <DrawerContent className="px-4">
        <DrawerHeader className="text-left">
          <DrawerTitle>Nastavitve novičke</DrawerTitle>
          <DrawerDescription>Uredi in objavi novičko</DrawerDescription>
        </DrawerHeader>
        <PublishForm
          imageUrls={imageUrls}
          article_id={articleId}
          content={content}
          configure_article={configure_article}
          title={title}
          url={url}
          published={published}
          setDrawerOpen={setDrawerOpen}
        />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Prekliči</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
