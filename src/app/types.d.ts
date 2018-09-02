import * as React from "react";

declare module "auto-bind" {
  export function react(
    component: React.ComponentType<any>
  ): React.ComponentType<any>;
}
