import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { Router } from "@angular/router";
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  userDetails: any;
  LoginStatus$ = new BehaviorSubject<boolean>(false);
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userService.getUserProfile().subscribe(
      res => {
        this.userService.currentUser = res;
        this.userDetails = this.userService.currentUser;
        this.LoginStatus$.next(true)
      },
      err => { 
        console.log(err);
      }
    );
  }

  onLogout(){
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }
}
