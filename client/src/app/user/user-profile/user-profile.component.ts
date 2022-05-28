import { Component, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { Router } from "@angular/router";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userDetails:any;
  constructor(private userService: UserService, private router: Router) { }

  ngOnInit(): void {
    this.userDetails = this.userService.currentUser;
  }
}
