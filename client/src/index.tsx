import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "features/home/Home";
import Room from "features/room/Room";
import { FocusStyleManager, Toaster } from "@blueprintjs/core";

FocusStyleManager.onlyShowFocusOnTabs();
export let toaster: Toaster;

createRoot(document.getElementById("toaster")!).render(
  <Toaster
    ref={(instance) => {
      toaster = instance!;
    }}
  />
);

const router = createBrowserRouter([
  {
    path: "room/:roomId",
    element: <Room />,
  },
  {
    path: "/",
    element: <Home />,
  },
]);

createRoot(document.getElementById("root") as HTMLElement).render(
  <RouterProvider router={router} />
);
