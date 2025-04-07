import { Component, type OnInit, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { RouterLink } from "@angular/router"

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./landing-page.component.html",
  styleUrls: ["./landing-page.component.css"],
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  constructor() {}

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    
    this.initCounters()
    this.initAOS()
  }

  private initCounters(): void {
    const counters = document.querySelectorAll(".counter")
    const speed = 200 

    counters.forEach((counter) => {
      const target = +counter.getAttribute("data-target")!
      let count = 0

      const updateCount = () => {
        const increment = target / speed

        if (count < target) {
          count += increment
          ;(counter as HTMLElement).innerText = Math.ceil(count).toString()
          setTimeout(updateCount, 1)
        } else {
          ;(counter as HTMLElement).innerText = target.toString()
        }
      }

      updateCount()
    })
  }

  private initAOS(): void {
    this.implementScrollAnimation()
  }

  private implementScrollAnimation(): void {
    const animatedElements = document.querySelectorAll("[data-aos]")

    const checkIfInView = () => {
      animatedElements.forEach((element) => {
        const elementPosition = element.getBoundingClientRect()
        const windowHeight = window.innerHeight

        if (elementPosition.top < windowHeight * 0.8) {
          element.classList.add("animated")

        
          const animationType = element.getAttribute("data-aos")
          if (animationType) {
            element.classList.add(animationType)
          }
        }
      })
    }
    window.addEventListener("scroll", checkIfInView)
    checkIfInView()
  }
}

