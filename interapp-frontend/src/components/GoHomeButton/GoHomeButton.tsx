'use client';
import { useRouter } from "next/navigation";
import { Button } from "@mantine/core";
import {memo } from "react";

const GoHomeButton = () => {
  const router = useRouter();
  return <Button onClick={() => router.push("/")} variant="outline" color="green">
      Go Home
    </Button>;
};

export default memo(GoHomeButton);