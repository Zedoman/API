import React, { Component } from "react";
import NewReleases from "../components/categories/NewReleases";

import { ToastContainer } from "react-toastify";

export class Home extends Component {
  render() {
    return (
      <div className="font-urbanist bg-white-50">

        <div>
          <NewReleases />
        </div>
        <ToastContainer />
      </div>
    );
  }
}

export default Home;
