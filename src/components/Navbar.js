import React from "react";
import Identicon from "identicon.js"; // It

const Navbar = (props) => {
  const account = props.account;

  return (
    <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
      <h3 className="navbar-brand col-sm-3 col-mid-2 mr-0">EthSwap</h3>
      <ul className="navbar-nav px-3">
        <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
          <small className="text-white">
            <span id="account">{account}</span>
          </small>
          {account ? (
            <img
              className="ml-2"
              width="30"
              height="30"
              src={`data:image/png;base64,${new Identicon(
                account,
                30
              ).toString()}`}
              alt=""
            />
          ) : (
            <span></span>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
